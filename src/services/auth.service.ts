import { singleton } from 'tsyringe';
import { MsalProvider } from '../providers/msal.provider';
import { AuthenticationResult } from '@azure/msal-node';
import { ContextProvider, UserMe } from '../providers/context.provider';
import { GraphService } from './graph.service';

const DEFAULT_SCOPES = ['user.read', 'calendars.readwrite', 'calendars.read'];

/**
 * This service provides all the methods for retrieving and refreshing access tokens.
 */
@singleton()
export class AuthService {
  /**
   * @constructor
   * @param {MsalProvider} msalProvider
   * @param contextProvider
   * @param graphService
   */
  constructor(
    private readonly msalProvider: MsalProvider,
    private readonly contextProvider: ContextProvider,
    private readonly graphService: GraphService
  ) {}

  /**
   * Creates a new authentication URL.
   * @param {string} redirectUri
   * @param {string[]} additionalScopes
   */
  createAuthUrl(redirectUri: string, additionalScopes?: string[]): Promise<string> {
    const pca = this.msalProvider.getPca();

    return pca.getAuthCodeUrl({
      scopes: [...DEFAULT_SCOPES, ...(additionalScopes || [])],
      redirectUri,
    });
  }

  /**
   * Acquires a token by the received code.
   * @param {string} code
   * @param {string} redirectUri
   * @param {string[]} additionalScopes
   */
  acquireTokenByCode(
    code: string,
    redirectUri: string,
    additionalScopes?: string[]
  ): Promise<AuthenticationResult | null> {
    const pca = this.msalProvider.getPca();

    return pca.acquireTokenByCode({
      redirectUri,
      code,
      scopes: [...DEFAULT_SCOPES, ...(additionalScopes || [])],
    });
  }

  /**
   * Checks the validity of an access token and if it's valid, put it in the context.
   */
  async setAccessToken(accessToken: string) {
    try {
      this.contextProvider.setAccessToken(accessToken);

      const meResp = await this.graphService.call<UserMe>('/me');
      if (meResp.error) {
        console.debug('invalid answer to /me query:', meResp);
        return false;
      }
      this.contextProvider.setUserMe(meResp);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}
