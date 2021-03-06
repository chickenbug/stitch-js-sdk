/**
 * Copyright 2018-present MongoDB, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  MemoryStorage,
  Method,
  StitchAuthRequest,
  StitchCredential,
  StitchRequestClient,
  Transport
} from "mongodb-stitch-core-sdk";

import AdminFetchTransport from "./AdminFetchTransport";
import { Apps } from "./Resources";
import StitchAdminAuth from "./StitchAdminAuth";
import StitchAdminAuthRoutes from "./StitchAdminAuthRoutes";
import { StitchAdminUser } from "./StitchAdminUser";
import {
  StitchAdminUserProfile,
  StitchAdminUserProfileCodec
} from "./StitchAdminUserProfile";

export default class StitchAdminClient {
  public static readonly apiPath = "/api/admin/v3.0";
  public static readonly defaultServerUrl = "http://localhost:9090";
  public static readonly defaultRequestTimeout = 15.0;

  private readonly adminAuth: StitchAdminAuth;
  private readonly authRoutes: StitchAdminAuthRoutes;

  public constructor(
    baseUrl: string = StitchAdminClient.defaultServerUrl,
    transport: Transport = new AdminFetchTransport(),
    requestTimeout: number = StitchAdminClient.defaultRequestTimeout
  ) {
    const requestClient = new StitchRequestClient(baseUrl, transport);

    this.authRoutes = new StitchAdminAuthRoutes();

    this.adminAuth = new StitchAdminAuth(
      requestClient,
      this.authRoutes,
      new MemoryStorage("<admin>")
    );
  }

  public adminProfile(): Promise<StitchAdminUserProfile> {
    const req = new StitchAuthRequest.Builder()
      .withMethod(Method.GET)
      .withPath(this.authRoutes.profileRoute)
      .build();

    return this.adminAuth.doAuthenticatedRequestWithDecoder(
      req,
      new StitchAdminUserProfileCodec()
    );
  }

  public apps(groupId: string): Apps {
    return new Apps(
      this.adminAuth,
      `${StitchAdminClient.apiPath}/groups/${groupId}/apps`
    );
  }

  public loginWithCredential(
    credential: StitchCredential
  ): Promise<StitchAdminUser> {
    return this.adminAuth.loginWithCredentialInternal(credential);
  }

  public logout(): Promise<void> {
    return this.adminAuth.logoutInternal();
  }

  public close(): void {
    this.adminAuth.close();
  }
}
