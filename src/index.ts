import { Container, ContainerModule, interfaces } from 'inversify';
import { ILogger } from './interfaces/logger.interface';
import { App } from './app';
import { ExceptionFilter } from './errors/exception.filter';
import { LoggerService } from './services/logger.service';
import { UserController } from './controllers/users.controller';
import { TYPES } from './types/types';
import { IExceptionFilter } from './errors/exception.filter.interface';
import { ProductController } from './controllers/products.controller';
import { PhoneController } from './controllers/phones.controller';
import { SequelizeService } from './services/sequelize.service';
import { IUserController } from './interfaces/users.controller.interface';
import { IPhoneController } from './interfaces/phone.controller.interface';
import { IProductController } from './interfaces/products.controller.interface';
import { IUserService } from './interfaces/user.interface';
import { UserService } from './services/user.service';
import { IProductService } from './interfaces/product.interface';
import { ProductService } from './services/product.service';
import { ISequelize } from './interfaces/sequelize.interface';
import { IConfigService } from './interfaces/config.service.interface';
import { ConfigService } from './services/config.service';

export interface IBootstrapReturn {
  appContainer: Container;
  app: App;
}

export const appBindings = new ContainerModule((bind: interfaces.Bind) => {
  bind<ILogger>(TYPES.ILogger).to(LoggerService).inSingletonScope();
  bind<IExceptionFilter>(TYPES.ExceptionFilter).to(ExceptionFilter);
  bind<IUserService>(TYPES.UserService).to(UserService);
  bind<IUserController>(TYPES.UserController).to(UserController);
  bind<IProductService>(TYPES.ProductService).to(ProductService);
  bind<IProductController>(TYPES.ProductController).to(ProductController);
  bind<IPhoneController>(TYPES.PhoneController).to(PhoneController);
  bind<ISequelize>(TYPES.SequelizeService)
    .to(SequelizeService)
    .inSingletonScope();
  bind<IConfigService>(TYPES.ConfigService)
    .to(ConfigService)
    .inSingletonScope();
  bind<App>(TYPES.Application).to(App);
});

function bootstrap(): IBootstrapReturn {
  const appContainer = new Container();
  appContainer.load(appBindings);
  const app = appContainer.get<App>(TYPES.Application);
  app.init();
  return { app, appContainer };
}

export const { app, appContainer } = bootstrap();
