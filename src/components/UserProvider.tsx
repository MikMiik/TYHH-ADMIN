"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/hooks/redux";
import { getCurrentUser } from "@/lib/features/auth/authSlice";

function UserProvider() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Only dispatch getCurrentUser once on mount, like TYHH MUI
    dispatch(getCurrentUser());
  }, [dispatch]);

  return null;
}

export default UserProvider;
