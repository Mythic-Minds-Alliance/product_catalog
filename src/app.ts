import 'reflect-metadata';
import cors from 'cors';
import express, { Express } from 'express';
import { Server } from 'http';
import { ILogger } from './interfaces/logger.interface';
import { TYPES } from './types/types';
import { injectable, inject } from 'inversify';
import { ISequelize } from './interfaces/sequelize.interface';
import { IUserService } from './interfaces/user.service.interface';
import { IExceptionFilter } from './errors/exception.filter.interface';
import { UserController } from './controllers/users.controller';
import { ProductController } from './controllers/products.controller';
import { IConfigService } from './interfaces/config.service.interface';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { AuthGuard } from './middlewares/auth.guard';

@injectable()
export class App {
  app: Express;
  server: Server;
  port: number | string | undefined;

  constructor(
    @inject(TYPES.ILogger) private logger: ILogger,
    @inject(TYPES.SequelizeService) private sequelizeService: ISequelize,
    @inject(TYPES.UserService) private userService: IUserService,
    @inject(TYPES.UserController) private userController: UserController,
    @inject(TYPES.ProductController)
    private productController: ProductController,
    @inject(TYPES.ExceptionFilter) private exceptionFilter: IExceptionFilter,
    @inject(TYPES.ConfigService) private configService: IConfigService,
    @inject(TYPES.AuthGuard) private authGuard: AuthGuard,
  ) {
    this.app = express();
    this.port = this.configService.get('PORT');
    const authMiddleware = new AuthMiddleware(this.configService.get('SECRET'));
    this.app.use(authMiddleware.execute.bind(authMiddleware));
    this.configureMiddleware();
  }

  useCors(): void {
    this.app.use(
      cors({
        origin: this.configService.get('CLIENT_URL'),
        credentials: true,
      }),
    );
  }

  configureMiddleware(): void {
    this.app.use(express.json());
    this.useCors();
    this.useRoutes();
    this.useExceptionFilters();
    this.useStaticImg();
  }

  useRoutes(): void {
    this.app.use('/users', this.userController.router);
    this.app.use('/', this.productController.router);
  }

  useExceptionFilters(): void {
    this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
  }

  useStaticImg(): void {
    this.app.use(express.static('public'));
    this.app.use(express.static(__dirname + '/public'));
  }

  public async init(): Promise<void> {
    this.server = this.app.listen(this.port);
    this.logger.log(
      `Server started on ${this.configService.get('SERVER_HOST')}:${this.port}`,
    );
  }
}
