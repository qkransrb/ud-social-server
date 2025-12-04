declare namespace Express {
  export interface Request {
    currentUser: IUserPayload;
  }
}

interface IUserPayload {
  _id: string;
  name: string;
  email: string;
  role: string;
}
