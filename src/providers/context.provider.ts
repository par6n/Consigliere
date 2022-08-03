import { singleton } from 'tsyringe';

export type UserMe = {
  error?: unknown;
  mail?: string;
  givenName?: string;
  displayName?: string;
};

/**
 * Provides context: shared data between classes.
 * @class
 */
@singleton()
export class ContextProvider {
  protected accessToken = '';
  protected userMe: UserMe = {};

  public setAccessToken(token: string) {
    this.accessToken = token;
  }

  public getAccessToken() {
    return this.accessToken;
  }

  public setUserMe(userMe: UserMe) {
    this.userMe = userMe;
  }

  public getUserMe() {
    return this.userMe;
  }
}
