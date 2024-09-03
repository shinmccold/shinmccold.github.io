
import React from "react";
import { Timeline } from "../components/ui/Timeline";

export function TimelineComponent({data}) {
 
  return (
    (<div className="w-full">
      <Timeline data={data} />
    </div>)
  );
}
