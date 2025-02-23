import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';
import { apiGet } from "../utils/makeApiCall";

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: useStorage('accessToken', null),
    refreshToken: useStorage('refreshToken', null),
    idToken: useStorage('idToken', null),
    loggedInUser: useStorage('loggedInUser', null)
  }),

  getters: {
    getAccessToken: (state) => state.accessToken,
    getRefreshToken: (state) => state.refreshToken,
    getIdToken: (state) => state.idToken,
    isAuthenticated: (state) => !!state.accessToken,
    getLoggedInUser: (state) => state.loggedInUser
  },

  actions: {
    setAuthToken({ accessToken, refreshToken, idToken }) {
      this.accessToken = accessToken || null;
      this.refreshToken = refreshToken || null;
      this.idToken = idToken || null;
    },

    clearAuthToken() {
      this.accessToken = null;
      this.refreshToken = null;
      this.idToken = null;
    },

    logout() {
      this.clearAuthToken();
    },

    async fetchLoggedInUserDetails(forceRefresh = false) {
      if (!this.loggedInUser || forceRefresh) {
        try {

          const response = await apiGet("/api/user/details");
    
          this.loggedInUser = JSON.stringify(response);
          return response;
        } catch (error) {
          console.error("Failed to fetch user details:", error);
        }
      }
      return JSON.parse(this.loggedInUser);
    },

    clearLoggedInUserDetails() {
      this.loggedInUser = null
    }
  }
});
