import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";

import { router } from "./routes/router";
import { queryClient } from "./lib/queryClient";
import { PushNotificationBridge } from "./components/common/PushNotificationBridge";

import "./styles/app.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <PushNotificationBridge />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
