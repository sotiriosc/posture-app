"use client";

import { useSyncExternalStore } from "react";
import {
  getTrainingSyncStatus,
  subscribeTrainingSyncStatus,
} from "@/lib/trainingSyncClient";

export const useTrainingSyncStatus = () =>
  useSyncExternalStore(
    subscribeTrainingSyncStatus,
    getTrainingSyncStatus,
    getTrainingSyncStatus
  );
