import chalk from 'chalk';
import { resolve } from 'path';
import { UserInterface } from '.';
import { FileStorageService } from '../services/file-storage.service';
import { WebServerService } from '../services/web-server.service';
import { Server } from 'http';
import { AuthService } from '../services/auth.service';
import { exec } from 'child_process';
import { injectable } from 'tsyringe';
import { AuthenticationResult } from '@azure/msal-node';
import { TimeAdvisorService } from '../services/time-advisor.service';
import { RoomFinderService, RoomStatus } from '../services/room-finder.service';
import { ContextProvider } from '../providers/context.provider';
import { BookingService, Event } from '../services/booking.service';

const CLI_STORAGE_FILE_NAME = resolve(__dirname, 'cli-storage.json');
const CLI_ENTRY_KEY = 'cliUser';
const PORT = Number(process.env.PORT) || 3000;

/**
 * This is the single-user CLI, mostly created for development and demo purposes.
 * @class
 */
@injectable()
export class CliInterface implements UserInterface {
  private readonly fileStorageService = new FileStorageService(CLI_STORAGE_FILE_NAME);
  private callbackServer: Server | undefined = undefined;

  /**
   * @constructor
   * @param {ContextProvider} contextProvider
   * @param {WebServerService} webServerService
   * @param {AuthService} authService
   * @param {TimeAdvisorService} timeAdvisorService
   * @param {RoomFinderService} roomFinderService
   * @param {BookingService} bookingService
   */
  constructor(
    private readonly contextProvider: ContextProvider,
    private readonly webServerService: WebServerService,
    private readonly authService: AuthService,
    private readonly timeAdvisorService: TimeAdvisorService,
    private readonly roomFinderService: RoomFinderService,
    private readonly bookingService: BookingService
  ) {}

  /**
   * Run is the entry-point of a user interface.
   */
  async run() {
    CliInterface.greet();

    const isAccountOK = await this.checkAccountData();
    if (!isAccountOK) {
      console.log(`🙂 Please log in with your work email.`);
      await this.startAuthFlow();
    }

    console.log(`✅ You are logged in using your account: "${this.contextProvider.getUserMe().mail}".`);

    await this.startBookingFlow();
  }

  /**
   * Booking flow
   */
  private async startBookingFlow() {
    const [from, to] = this.timeAdvisorService.suggest();

    console.log(
      `\n⏰ I'm going to find you a room for ${chalk.bold(
        `${CliInterface.formatTime(from)} to ${CliInterface.formatTime(to)}.`
      )}`
    );

    const inquirer = await import('inquirer');

    const rooms = await this.roomFinderService.listRooms(from, to);
    const { roomMailbox } = await inquirer.prompt({
      type: 'list',
      name: 'roomMailbox',
      message: '🚪 Choose a room:',
      choices: rooms.map((entry) => {
        return entry.available
          ? { name: entry.room.name, value: entry.room.mailbox }
          : { name: entry.room.name, disabled: 'Busy' };
      }),
    });
    const selectedRoom = rooms.find((r) => r.room.mailbox === roomMailbox) as RoomStatus;

    const { confirm } = await inquirer.prompt({
      type: 'confirm',
      name: 'confirm',
      message: `Confirm to book the room ${selectedRoom?.room.name} from ${CliInterface.formatTime(
        from
      )} to ${CliInterface.formatTime(to)}`,
    });
    if (!confirm) {
      console.log(`😉 Whatever you say, boss. Your room was not booked.`);
      process.exit(0);
    }

    const event: Event = {
      meetingName: 'Consigliere: sitdown',
      start: from,
      end: to,
      room: selectedRoom.room,
    };

    const resp = await this.bookingService.book(event);
    if (resp.error) {
      console.log(`😞 I'm sorry, boss. There was an error when I was booking your meeting:`);
      console.log(JSON.stringify(resp));
      process.exit(1);
    }

    console.log(`😎👍 Booking was successful, boss. The event is on your calendar.\n😉 Enjoy your meeting!`);
  }

  private static formatTime(date: Date) {
    return new Intl.DateTimeFormat('en-NL', {
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  }

  /**
   * Greetings
   */
  private static greet() {
    console.log(`👋 Hey Mobster, I'll find you a safe place for a ${chalk.bold('sitdown')}.`);
    console.log(`💡 Actually, I'll help you ${chalk.bold('quickly book a room in the office')}.\n`);
  }

  /**
   * Check for the account data.
   */
  private async checkAccountData() {
    const accountData = (await this.fileStorageService
      .find(CLI_ENTRY_KEY)
      .catch(() => null)) as AuthenticationResult | null;
    if (!accountData) {
      return false;
    }

    return this.authService.setAccessToken(accountData.accessToken);
  }

  /**
   * Start the authentication with code flow.
   */
  private async startAuthFlow() {
    this.callbackServer = this.webServerService.listen(PORT);
    const redirectUri = `http://localhost:${PORT}/redirect`;

    const authUrl = await this.authService.createAuthUrl(redirectUri);

    console.log(`🔐 Browser will be opened in 3 seconds...`);

    setTimeout(() => {
      exec(`open "${authUrl}"`);
    }, 3000);

    const redirectPromise = new Promise<string>((res) => {
      this.webServerService.on('callbackCalled', ({ code }) => {
        res(code);
      });
    });
    const timeoutPromise = new Promise<null>((res) => {
      setTimeout(() => {
        res(null);
      }, 30000);
    });

    const code = await Promise.race([redirectPromise, timeoutPromise]);
    if (!code) {
      console.log(`😔 Oops, I did not receive the authentication code. Why don't you try one more time?`);
      process.exit(1);
    }
    this.callbackServer.close();

    const authResult = await this.authService.acquireTokenByCode(code, redirectUri);
    if (!authResult) {
      console.log(`😔 Oops, I could not get a hold of your token. Try again later, maybe?`);
      process.exit(1);
    }

    await this.fileStorageService.upsert(CLI_ENTRY_KEY, authResult as object);
    await this.authService.setAccessToken(authResult.accessToken);
  }
}
