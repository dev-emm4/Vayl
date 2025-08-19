import ExtensionService from "./extensionService.js";
import ConflictError from "../error/conflictError.js";

class ExtensionController {
  constructor() {
    this.extensionService = new ExtensionService();
  }

  async disableBlocking(aRequest, aResponse) {
    try {
      await this.extensionService.disableBlockingRuleForUrl(
        aRequest.initiatorUrl
      );

      const message = {
        status: "success",
      };

      aResponse(message);
    } catch (error) {
      if (
        error instanceof ConflictError &&
        error.message == "blocking is already disabled"
      ) {
        const message = {
          status: "error",
          message: error.message,
        };

        aResponse(message);
      } else if (
        error instanceof ConflictError &&
        error.message == "dynamic rule has reach quota"
      ) {
        const message = {
          status: "error",
          message: error.message,
        };

        aResponse(message);
      } else {
        console.log(error);
      }
    }
  }

  async enableBlocking(aRequest, aResponse) {
    try {
      await this.extensionService.enableBlockingForUrl(aRequest.initiatorUrl);

      const message = {
        status: "success",
      };

      aResponse(message);
    } catch (error) {
      if (
        error instanceof ConflictError &&
        error.message == "blocking is already enabled"
      ) {
        const message = {
          status: "error",
          message: error.message,
        };

        aResponse(message);
      } else {
        console.log(error);
      }
    }
  }

  async isBlockingEnabled(aRequest, aResponse) {
    const isBlockingEnabled = await this.extensionService.isBlockingEnabledFor(
      aRequest.initiatorUrl
    );
    const message = {
      status: "success",
      enability: isBlockingEnabled,
    };

    aResponse(message);
  }
}

export default ExtensionController;
