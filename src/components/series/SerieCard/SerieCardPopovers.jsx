"use client";

import ConfirmPopover from "@/components/ui/ConfirmPopover/ConfirmPopover";
import WatchlistPopover from "@/components/ui/WatchlistPopover/WatchlistPopover";
import RatingsPopover from "@/components/ui/RatingsPopover/RatingsPopover";

export default function SerieCardPopovers({
  serie,
  isTracked,
  isDropped,
  confirmPopover,
  watchlistPopover,
  ratingsPopover,
  onConfirm,
}) {
  return (
    <>
      {/* Confirm Popover */}
      {confirmPopover.isOpen && (
        <ConfirmPopover
          serieName={serie.name}
          firstAirDate={serie.first_air_date}
          isTracked={isTracked}
          isDropped={isDropped}
          onConfirm={onConfirm}
          popoverRef={confirmPopover.popoverRef}
        />
      )}
      {/* Watchlist Popover */}
      {watchlistPopover.isOpen && (
        <WatchlistPopover serie={serie} onClose={watchlistPopover.close} popoverRef={watchlistPopover.popoverRef} />
      )}
      {/* Rating Popover */}
      {ratingsPopover.isOpen && <RatingsPopover serie={serie} popoverRef={ratingsPopover.popoverRef} />}
    </>
  );
}
