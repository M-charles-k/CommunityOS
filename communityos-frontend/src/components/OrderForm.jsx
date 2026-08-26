import React, { useEffect, useState } from "react";
import * as orderService from "../services/orders.js";
import * as serviceService from "../services/services.js";
import * as communityService from "../services/communities.js";

export default function OrderForm({ token, onCreated }) {
  const [services, setServices] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!token) return;

      setLoadingData(true);
      setError("");

      try {
        const results = await Promise.allSettled([
          serviceService.getServices(),
          communityService.getCommunities(),
        ]);

        if (cancelled) return;

        const servicesResult = results[0];
        const communitiesResult = results[1];

        if (servicesResult.status === "fulfilled") {
          const servicesData = servicesResult.value || [];

          setServices(servicesData);

          if (servicesData.length > 0) {
            setSelectedService(servicesData[0].id);
          }
        } else {
          console.error(
            "Failed to load services:",
            servicesResult.reason
          );
        }

        if (communitiesResult.status === "fulfilled") {
          const communitiesData = communitiesResult.value || [];

          setCommunities(communitiesData);

          if (communitiesData.length > 0) {
            setSelectedCommunity(communitiesData[0].id);
          }
        } else {
          console.error(
            "Failed to load communities:",
            communitiesResult.reason
          );
        }

        if (
          servicesResult.status === "rejected" &&
          communitiesResult.status === "rejected"
        ) {
          setError(
            "Unable to load services and communities. Please try again."
          );
        }
      } catch (err) {
        console.error("Failed to load form data:", err);

        if (!cancelled) {
          setError("Failed to load form data");
        }
      } finally {
        if (!cancelled) {
          setLoadingData(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!selectedCommunity) {
      setError("Please select a community.");
      return;
    }

    if (!selectedService) {
      setError("Please select a service.");
      return;
    }

    setSubmitting(true);

    try {
      await orderService.createOrder({
        communityId: selectedCommunity,
        items: [
          {
            serviceId: selectedService,
            quantity: Number(quantity),
          },
        ],
        notes,
      });

      onCreated();
    } catch (err) {
      console.error("Failed to create order:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create order"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="order-form">
      <div className="page-header">
        <h1>Request Service</h1>
        <p>Order essential services for your unit</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {loadingData && (
        <div className="alert">
          Loading available services...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Community</label>

          <select
            value={selectedCommunity}
            onChange={(e) =>
              setSelectedCommunity(e.target.value)
            }
            required
            disabled={loadingData}
          >
            <option value="">
              Select a community
            </option>

            {communities.map((community) => (
              <option
                key={community.id}
                value={community.id}
              >
                {community.name}
              </option>
            ))}
          </select>

          {!loadingData &&
            communities.length === 0 && (
              <small>
                No communities are currently available.
              </small>
            )}
        </div>

        <div className="form-group">
          <label>Service</label>

          <select
            value={selectedService}
            onChange={(e) =>
              setSelectedService(e.target.value)
            }
            required
            disabled={loadingData}
          >
            <option value="">
              Select a service
            </option>

            {services.map((service) => (
              <option
                key={service.id}
                value={service.id}
              >
                {service.name} - KSh {service.unitPrice}
              </option>
            ))}
          </select>

          {!loadingData &&
            services.length === 0 && (
              <small>
                No services are currently available.
              </small>
            )}
        </div>

        <div className="form-group">
          <label>Quantity</label>

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) =>
              setQuantity(e.target.value)
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Notes (Optional)</label>

          <textarea
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            placeholder="Add any special instructions..."
            rows="4"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={
            submitting ||
            loadingData ||
            !selectedService ||
            !selectedCommunity
          }
        >
          {submitting
            ? "Creating order..."
            : "Create Order"}
        </button>
      </form>
    </div>
  );
}