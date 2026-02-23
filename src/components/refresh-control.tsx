import { useState } from "react";
import { RefreshControl } from "react-native";

export default function RefetchControl({
  refetch,
}: {
  refetch: () => Promise<unknown>;
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  return (
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      title="Refresh"
    />
  );
}
