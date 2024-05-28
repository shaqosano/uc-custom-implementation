const CUSTOMER_ID = '2skdb1YDRiZvJfB1dPK'
const CONFIG_ID = '64f49d97-499c-49b4-8b17-a63ee921b841'
const COLLECTION_TYPE = 'published'

let apiToken

const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Retrieve the API token from the Osano UC Core API
 * @returns {Promise<{token: string}>}
 */
const getApiToken = async () => {
    try {
        const response = await fetch('https://uc.api.osano.dev/v2/token/create', {
            method: 'POST',
            body: JSON.stringify({
                customerId: CUSTOMER_ID,
                configId: CONFIG_ID
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if(response.status !== 200) {
            throw new Error('Error fetching API token')
        }

        const {['x-uc-api-key']: apiTokenResponse} = await response.json()

        apiToken = apiTokenResponse
    } catch (error) {
        console.error(error, 'Error fetching API token')
    }
}

/**
 * Retrieve the collection data from the Osano UC Core API
 * @return {Promise<{data: any}>}
 */
const getCollectionData = async () => {
    try {
        const queryString = new URLSearchParams({
            customerId: CUSTOMER_ID,
            configId: CONFIG_ID,
            type: COLLECTION_TYPE
        }).toString()

        const response = await fetch('https://uc.api.osano.dev/v2/collections' + '?' + queryString, {
            headers: {
                'x-uc-api-key': apiToken
            },
        })

        if(response.status !== 200) {
            throw new Error('Error fetching collection data')
        }

        return response.json()
    } catch (error) {
        console.error(error, 'Error fetching collection data')
    }
}

const submitConsent = async (privacyProtocolId, collectionId, accepted, anonymousId) => {
    try {
        const action = accepted ? 'ACCEPT' : 'REJECT'
        const response = await fetch('https://uc.api.osano.dev/v2/consents', {
            method: 'POST',
            headers: {
                'x-uc-api-key': apiToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subject: {
                    anonymousId
                },
                compliance: {
                    privacyPolicy: {
                        version: '1.0.0',
                        url: 'https://example.com/privacy-policy'
                    },
                    gpc: 0
                },
                actions: [
                    {
                        target: privacyProtocolId,
                        vendor: collectionId,
                        action
                    }
                ],
                attributes: {},
                tags: []
            })
        })

        if(response.status !== 201) {
            throw new Error('Error submitting consent')
        }

        console.log('Consent submitted successfully')
    } catch (error) {
        console.error(error, 'Error submitting consent')
    }
    
}

const appendConsents = (consents, containerId, subjectId) => {
    const container = document.getElementById(containerId)
    const ul = document.createElement('ul')
    consents.forEach(({title, description, acceptWording, rejectWording, collectionId, privacyProtocolId}) => {
        const li = document.createElement('li');
        const div = document.createElement('div');
        const strong = document.createElement('strong');
        const p = document.createElement('p');
        const acceptButton = document.createElement('button');
        const rejectButton = document.createElement('button');

        strong.textContent = title;
        p.textContent = description;
        acceptButton.textContent = acceptWording;
        rejectButton.textContent = rejectWording;

        acceptButton.addEventListener('click', () => {
            submitConsent(privacyProtocolId, collectionId, true, subjectId)
        });

        rejectButton.addEventListener('click', () => {
            console.log(subjectId);
            submitConsent(privacyProtocolId, collectionId, false, subjectId)
        });

        div.appendChild(strong);
        div.appendChild(p);
        div.appendChild(acceptButton);
        div.appendChild(rejectButton);
        li.appendChild(div);
        ul.appendChild(li);
    });
    container.appendChild(ul)
}

async function main() {
    const subjectId = uuidv4()
    await getApiToken()
    const {collection} = await getCollectionData()
    const {consents, preferences} = collection
    appendConsents(consents, 'consents-list', subjectId)
    appendConsents(preferences, 'preferences-list', subjectId)
}

main()