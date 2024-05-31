const CUSTOMER_ID = '2skdb1YDRiZvJfB1dPK'
const CONFIG_ID = '64f49d97-499c-49b4-8b17-a63ee921b841'
const COLLECTION_TYPE = 'published'

const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const appendConsents = (consents, containerId, subjectId, client) => {
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
            client.createConsent({
              subject: {
                  anonymousId: subjectId
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
                      action: 'ACCEPT'
                  }
              ],
              attributes: {},
              tags: []
            })
        });

        rejectButton.addEventListener('click', () => {
          client.createConsent({
            subject: {
                anonymousId: subjectId
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
                    action: 'REJECT'
                }
            ],
            attributes: {},
            tags: []
          })
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
    const { UnifiedConsentByOsanoSDK } = window.unifiedConsentJsSdk
    const accessToken = await UnifiedConsentByOsanoSDK.getToken(
      {
        /** URL of authorization services provider */
        issuer: 'https://uc.api.osano.dev/v2/token/create',
        /** The  config Id */
        configId: CONFIG_ID,
        /** The customer Id */
        customerId: CUSTOMER_ID
      },
    )
    const client = UnifiedConsentByOsanoSDK.createClient({
      token: accessToken,
      apiUrl: 'https://uc.api.osano.dev/v2',
    })
    const {collection} = await client.getCollection(CONFIG_ID, CUSTOMER_ID, 'published')
    const {consents, preferences} = collection
    appendConsents(consents, 'consents-list', subjectId, client)
    appendConsents(preferences, 'preferences-list', subjectId, client)
}

main()