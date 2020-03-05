import { ApiService } from "./api.service";
import { TokenService } from "./storage.service";

class AuthenticationError extends Error {
  constructor(errorCode, message) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.errorCode = errorCode;
  }
}

const UserService = {
  /**
   * Login the user and store the access token to the TokenService
   *
   * @returns access_token
   * @throws AuthenticationError
   **/

  login: function(email, password) {
    return new Promise((resolve, reject) => {
      ApiService.post("auth", {
        email: email,
        password: password
      })
        .then(res => {
          TokenService.saveToken(res.data);
          ApiService.setHeader();

          resolve(res.data);
        })
        .catch(error => {
          reject(
            new AuthenticationError(error.response.status, error.response.data)
          );
        });
    });
  },

  /**
   * Logout the current user by removing the token from storage.
   *
   * Will also remove `Authorization Bearer <token>` header from future requests.
   **/
  logout() {
    // Remove the token and remove Authorization header from Api Service as well
    TokenService.removeToken();
    ApiService.removeHeader();
  }
};

export default UserService;

export { UserService, AuthenticationError };
