/**
 * Pathao API Integration Utility
 *
 * This module provides functions to interact with Pathao's delivery API
 * for creating orders, tracking shipments, and updating delivery status.
 *
 * IMPORTANT: Add your Pathao API credentials to .env file:
 * - PATHAO_API_URL=https://api-hermes.pathao.com/api/v1
 * - PATHAO_CLIENT_ID=your_client_id
 * - PATHAO_CLIENT_SECRET=your_client_secret
 * - PATHAO_USERNAME=your_username
 * - PATHAO_PASSWORD=your_password
 * - PATHAO_STORE_ID=your_store_id
 */

const axios = require("axios");

class PathaoService {
  constructor() {
    this.baseURL =
      process.env.PATHAO_API_URL || "https://api-hermes.pathao.com/api/v1";
    this.clientId = process.env.PATHAO_CLIENT_ID;
    this.clientSecret = process.env.PATHAO_CLIENT_SECRET;
    this.username = process.env.PATHAO_USERNAME;
    this.password = process.env.PATHAO_PASSWORD;
    this.storeId = process.env.PATHAO_STORE_ID;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Check if Pathao integration is configured
   */
  isConfigured() {
    return !!(
      this.clientId &&
      this.clientSecret &&
      this.username &&
      this.password &&
      this.storeId
    );
  }

  /**
   * Get access token from Pathao API
   */
  async getAccessToken() {
    try {
      // Check if we have a valid token
      if (
        this.accessToken &&
        this.tokenExpiry &&
        Date.now() < this.tokenExpiry
      ) {
        return this.accessToken;
      }

      // Request new token
      const response = await axios.post(`${this.baseURL}/issue-token`, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        username: this.username,
        password: this.password,
        grant_type: "password",
      });

      this.accessToken = response.data.access_token;
      // Set expiry to 1 hour from now (adjust based on actual token expiry)
      this.tokenExpiry = Date.now() + 3600000;

      return this.accessToken;
    } catch (error) {
      console.error(
        "Pathao authentication error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to authenticate with Pathao API");
    }
  }

  /**
   * Create a delivery order in Pathao
   * @param {Object} orderData - Order details
   * @returns {Promise<Object>} Pathao order response
   */
  async createOrder(orderData) {
    try {
      if (!this.isConfigured()) {
        console.warn("Pathao API is not configured. Skipping order creation.");
        return null;
      }

      const token = await this.getAccessToken();

      const pathaoOrder = {
        store_id: this.storeId,
        merchant_order_id: orderData.orderId,
        recipient_name: `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}`,
        recipient_phone: orderData.shippingAddress.phone,
        recipient_address: orderData.shippingAddress.streetAddress,
        recipient_city: orderData.shippingAddress.townCity || "Dhaka",
        recipient_zone: orderData.shippingAddress.state || "Dhaka",
        amount_to_collect:
          orderData.paymentMethod === "cash" ? orderData.total : 0,
        item_type: 1, // 1 = Parcel, 2 = Document
        item_weight: 0.5, // in kg, adjust based on your needs
        item_description: `Order #${orderData.orderId}`,
      };

      const response = await axios.post(`${this.baseURL}/orders`, pathaoOrder, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return {
        consignment_id: response.data.data.consignment_id,
        order_id: response.data.data.order_id,
        merchant_order_id: response.data.data.merchant_order_id,
      };
    } catch (error) {
      console.error(
        "Pathao order creation error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to create order in Pathao");
    }
  }

  /**
   * Get tracking information for an order
   * @param {string} consignmentId - Pathao consignment ID
   * @returns {Promise<Object>} Tracking information
   */
  async trackOrder(consignmentId) {
    try {
      if (!this.isConfigured()) {
        console.warn("Pathao API is not configured.");
        return null;
      }

      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseURL}/orders/${consignmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data.data;

      // Map Pathao status to our internal status
      const status = this.mapPathaoStatus(data.order_status);

      return {
        consignmentId: data.consignment_id,
        status: status,
        statusMessage: data.order_status,
        pickupDate: data.pickup_date,
        deliveryDate: data.delivery_date,
        riderName: data.rider_name,
        riderPhone: data.rider_phone,
        trackingHistory: data.order_history || [],
      };
    } catch (error) {
      console.error(
        "Pathao tracking error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to get tracking information from Pathao");
    }
  }

  /**
   * Map Pathao status to our internal delivery status
   * @param {string} pathaoStatus - Pathao order status
   * @returns {string} Internal delivery status
   */
  mapPathaoStatus(pathaoStatus) {
    const statusMap = {
      Pending: "placed",
      "Pickup Requested": "confirmed",
      "Picked Up": "picked_up",
      "On Hold": "in_transit",
      "In Transit": "in_transit",
      "Out for Delivery": "out_for_delivery",
      Delivered: "delivered",
      Cancelled: "cancelled",
      "Return Requested": "failed",
      Returned: "failed",
    };

    return statusMap[pathaoStatus] || "in_transit";
  }

  /**
   * Get cities/zones available for delivery
   */
  async getCities() {
    try {
      if (!this.isConfigured()) {
        return [];
      }

      const token = await this.getAccessToken();

      const response = await axios.get(`${this.baseURL}/cities`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data.cities;
    } catch (error) {
      console.error(
        "Pathao cities error:",
        error.response?.data || error.message
      );
      return [];
    }
  }

  /**
   * Get zones for a specific city
   */
  async getZones(cityId) {
    try {
      if (!this.isConfigured()) {
        return [];
      }

      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseURL}/cities/${cityId}/zones`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.data.zones;
    } catch (error) {
      console.error(
        "Pathao zones error:",
        error.response?.data || error.message
      );
      return [];
    }
  }

  /**
   * Cancel a Pathao order
   */
  async cancelOrder(consignmentId) {
    try {
      if (!this.isConfigured()) {
        return null;
      }

      const token = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseURL}/orders/${consignmentId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Pathao cancel order error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to cancel order in Pathao");
    }
  }
}

// Export singleton instance
module.exports = new PathaoService();
