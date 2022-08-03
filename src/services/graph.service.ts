import { injectable } from 'tsyringe';
import { ContextProvider } from '../providers/context.provider';

/**
 * This is the service for calling Microsoft Graph APIs.
 */
@injectable()
export class GraphService {
  private readonly baseUrl = ' https://graph.microsoft.com/v1.0';

  /**
   * @constructor
   * @param {ContextProvider} contextProvider
   */
  constructor(private readonly contextProvider: ContextProvider) {}

  /**
   * Calls the given endpoint.
   */
  async call<T>(endpoint: string, requestOpts?: RequestInit): Promise<T> {
    const url = this.buildUrl(endpoint);
    const options = this.buildOptions(requestOpts);

    const resp = await fetch(url, options);
    const json = await resp.json();

    return json as T;
  }

  /**
   * Builds the URL for the given endpoint.
   */
  private buildUrl(endpoint: string) {
    return `${this.baseUrl}${endpoint}`;
  }

  /**
   * Builds the options for sending the request.
   */
  private buildOptions(options: RequestInit | undefined): RequestInit {
    return {
      ...(options || {}),
      headers: {
        ...(options?.headers || {}),
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.contextProvider.getAccessToken()}`,
      },
    };
  }
}
