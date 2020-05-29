import { ConfigService } from '@nestjs/config';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { PubSub, PubSubEngine } from 'graphql-subscriptions';
import Redis from 'ioredis';
import { PinoLogger } from 'nestjs-pino/dist';
import { authServices } from './auth';
import { formServices } from './form';
import { MailService } from './mail.service';
import { userServices } from './user';

export const services = [
  ...userServices,
  ...formServices,
  ...authServices,
  MailService,
  {
    provide: 'PUB_SUB',
    inject: [ConfigService, PinoLogger],
    useFactory: (configService: ConfigService, logger: PinoLogger): PubSubEngine => {
      const host = configService.get<string>('REDIS_HOST', null)
      const port = configService.get<number>('REDIS_PORT', 6379)

      if (host === null) {
        logger.warn('without redis graphql subscriptions will be unreliable in load balanced environments')
        return new PubSub()
      }

      const options = {
        host,
        port,
      }

      return new RedisPubSub({
        publisher: new Redis(options),
        subscriber: new Redis(options),
      })
    }
  },
]