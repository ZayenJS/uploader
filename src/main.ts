import { Application } from './app';
import router from './routes';

new Application()
  .loadConfig()
  .setCORSPolicy()
  .handleJSON()
  .handleURLEncodedForms()
  .handleMultipartForms()
  .handleStaticFiles()
  .setRouter(router)
  .startServer();
