import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { useState, useCallback } from "react";
import Spinner from "../Spinner/Spinner";
import { ThumbsUpIcon, MessageCircle, CheckCircleIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AuthUser } from "../../types/auth";

export default function HelpRequestDetails() {
  const { id } = useParams();
  const [isVoting, setIsVoting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const queryClient = useQueryClient();

  const { data: request, isLoading } = useQuery({
    queryKey: ["request", id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/requests/${id}`);
      if (!response.ok) throw new Error("Failed to fetch request details");
      return response.json();
    },
  });

  const { data: authUser } = useQuery<AuthUser>({
    queryKey: ["authUser"],
  });

  // Get the single request object
  const requestData = request?.data?.request;

  const handlePayment = useCallback(async () => {
    if (!requestData?.specificDetails?.amount) {
      toast.error("Invalid amount");
      return;
    }

    if (!authUser?.email) {
      toast.error("Please log in to make a payment");
      return;
    }

    setIsProcessingPayment(true);
    try {
      const response = await fetch(`/api/v1/requests/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: authUser.email,
          amount: requestData.specificDetails.amount,
          requestId: id,
        }),
      });

      const data = await response.json();

      if (data.status === "fail") {
        throw new Error(data.message || "Failed to initialize payment");
      }

      // Redirect to Paystack payment page
      window.location.href = data.data.authorizationUrl;
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(
        error.message || "Failed to process payment. Please try again.",
      );
    } finally {
      setIsProcessingPayment(false);
    }
  }, [requestData, id, queryClient, authUser?.email]);

  const { mutate: vote } = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`/api/v1/requests/${id}/vote`, {
          method: "POST",
        });

        const data = await response.json();

        if (data.status === "fail") {
          throw new Error(
            data.message || "Failed to vote request, please try again",
          );
        }

        return data;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      toast.success(data.message);
      setIsVoting(true);
    },
    onError: (error: any) =>
      toast.error(error.message || "Failed to vote, please try again"),
    onCancel: (data: any) => toast.error(data.message || "Payment cancelled"),
  });

  if (isLoading)
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-helpMe-950">
        <Spinner />
      </div>
    );
  if (!request?.data) return <div>Request not found</div>;

  const getStatusColor = () => {
    if (requestData?.status === "active")
      return "bg-green-100 text-green-800 shadow-sm";
    if (requestData?.status === "pending")
      return "bg-yellow-100 text-yellow-800 shadow-sm";
    if (requestData.status === "completed")
      return "bg-blue-100 text-blue-800 shadow-sm";
    return "bg-gray-100 text-gray-800 shadow-sm";
  };

  const getDaysLeft = () => {
    const endDate = new Date(requestData?.specificDetails?.deadline);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Completed";
    return `${diffDays} days left`;
  };

  const getStatusText = () => {
    const endDate = new Date(requestData?.specificDetails?.deadline);
    const today = new Date();
    if (endDate < today) return "Completed";
    else return "Active";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              {requestData?.name}
            </h1>
            <span
              className={`rounded-full px-4 py-1 text-sm font-semibold ${getStatusColor()}`}
            >
              {getStatusText()}
            </span>
          </div>
          <div className="mt-2 flex items-center space-x-4 text-gray-600">
            <span>
              {requestData?.city}, {requestData?.state}, {requestData?.country}
            </span>
            <span>•</span>
            <span className="capitalize">{requestData?.category}</span>
            <span>•</span>
            <span className="flex items-center gap-2 rounded-full px-4 py-1 text-sm font-semibold">
              <strong className="text-sm font-semibold text-green-500">
                Verified
              </strong>{" "}
              <CheckCircleIcon className="size-4 text-green-500" />
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Image */}
            <div className="mb-8 overflow-hidden rounded-lg">
              <img
                src={requestData?.image?.url}
                alt={requestData?.name}
                className="h-[400px] w-full object-cover"
              />
            </div>

            {/* Description */}
            <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Request Description
              </h2>
              <p className="text-gray-600">{requestData?.requestDescription}</p>
            </div>

            {/* Specific Details */}
            <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Specific Details
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Amount Needed
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${requestData?.specificDetails?.amount}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Deadline</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {requestData?.specificDetails?.deadline
                      ? format(
                          new Date(requestData.specificDetails.deadline),
                          "MMMM d, yyyy",
                        )
                      : "No deadline set"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            {/* Progress Card */}
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Progress
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Votes
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {requestData?.votes?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Comments
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {requestData?.comments?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => vote()}
                    disabled={isVoting}
                    className="flex cursor-pointer flex-col items-center justify-center"
                  >
                    <ThumbsUpIcon className="size-5 text-pink-400 transition-colors duration-300 hover:text-pink-600" />
                    <span className="text-[10px] text-helpMe-950">
                      <strong className="font-semibold">
                        {requestData?.votes?.length || 0}
                      </strong>{" "}
                      votes
                    </span>
                  </button>
                  <div className="flex cursor-pointer flex-col items-center justify-center">
                    <MessageCircle className="size-5 text-pink-400 transition-colors duration-300 hover:text-pink-600" />
                    <span className="text-[10px] font-light text-helpMe-950">
                      <strong className="font-semibold">
                        {requestData?.comments?.length || 0}
                      </strong>{" "}
                      comments
                    </span>
                  </div>
                </div>
                <button
                  disabled={
                    requestData.status === "completed" || isProcessingPayment
                  }
                  onClick={handlePayment}
                  className={
                    requestData.status === "completed" || isProcessingPayment
                      ? "cursor-not-allowed bg-gray-200 opacity-50"
                      : `rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-pink-600`
                  }
                >
                  {isProcessingPayment
                    ? "Processing..."
                    : requestData.status === "completed"
                      ? "Completed"
                      : "Render Help"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
