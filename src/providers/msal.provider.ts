import { singleton } from 'tsyringe';
import { ConfidentialClientApplication } from '@azure/msal-node';

/**
 * Provides one single instance of MSAL.
 * @class
 */
@singleton()
export class MsalProvider {
  /**
   * @var {ConfidentialClientApplication | null}
   */
  private pca: ConfidentialClientApplication | null = null;

  /**
   * Gets the in-memory instance or creates a new instance of PCA.
   * @returns {ConfidentialClientApplication}
   */
  getPca(): ConfidentialClientApplication {
    if (!this.pca) {
      this.pca = new ConfidentialClientApplication({
        auth: {
          clientId: process.env.CLIENT_ID || '',
          authority: process.env.AUTHORITY,
          clientSecret: process.env.CLIENT_SECRET,
        },
      });
    }

    return this.pca;
  }
}
