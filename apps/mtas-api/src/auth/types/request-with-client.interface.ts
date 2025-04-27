import { Request } from 'express';
import Client from 'src/clients/client.entity';

interface RequestWithClient extends Request {
  client: Client;
}

export default RequestWithClient;
