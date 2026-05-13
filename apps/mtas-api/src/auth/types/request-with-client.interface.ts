import { Request } from 'express';
import Client from 'src/clients/client.entity';

// To be used on req.user set by ClientBasicStrategy validate method
interface RequestWithClient extends Request {
  user: Client;
}

export default RequestWithClient;
