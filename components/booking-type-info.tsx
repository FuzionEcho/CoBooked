import { AlertTriangle, Info, Shield, ShieldAlert, ShieldCheck } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export enum TransferType {
  UNSPECIFIED = "TRANSFER_TYPE_UNSPECIFIED",
  MANAGED = "TRANSFER_TYPE_MANAGED",
  SELF_TRANSFER = "TRANSFER_TYPE_SELF_TRANSFER",
  PROTECTED_SELF_TRANSFER = "TRANSFER_TYPE_PROTECTED_SELF_TRANSFER",
}

export enum MashupType {
  NONE = "NONE",
  SUM_OF_ONE_WAY = "SUM_OF_ONE_WAY",
  NON_PROTECTED_SELF_TRANSFER = "NON_PROTECTED_SELF_TRANSFER",
}

interface BookingTypeInfoProps {
  transferType: TransferType
  isMultiBooking: boolean
  bookingLinksCount?: number
  mashupType?: MashupType
}

export function BookingTypeInfo({
  transferType,
  isMultiBooking,
  bookingLinksCount = 0,
  mashupType = MashupType.NONE,
}: BookingTypeInfoProps) {
  return (
    <div className="space-y-4">
      {/* Mashup Type Information */}
      {mashupType === MashupType.SUM_OF_ONE_WAY && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Sum of One-Way Mashup</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              This is a Sum-of-One-Way mashup. You'll need to make separate bookings for each leg of your journey.
            </p>
            <p className="font-medium">
              Important: If something goes wrong with one flight (like delays or cancellations), the other airline is
              not obligated to accommodate you. We recommend checking all booking links for availability before making
              any purchases.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {mashupType === MashupType.NON_PROTECTED_SELF_TRANSFER && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Non-Protected Self-Transfer Mashup</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              This is a Non-Protected Self-Transfer mashup. You'll need to collect your baggage and check in again at
              your connection point.
            </p>
            <p className="font-medium">
              Important: If you miss your connection, you'll need to buy a new ticket. There is no protection between
              flights. We strongly recommend allowing plenty of time between connections and checking all booking links
              for availability before making any purchases.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Transfer Type Information - only show if not a mashup or if it's a mashup with a specific transfer type */}
      {(mashupType === MashupType.NONE || transferType !== TransferType.UNSPECIFIED) && (
        <Alert variant={transferType === TransferType.MANAGED ? "default" : "warning"}>
          <div className="flex items-center gap-2">
            {transferType === TransferType.MANAGED ? (
              <ShieldCheck className="h-4 w-4" />
            ) : transferType === TransferType.PROTECTED_SELF_TRANSFER ? (
              <Shield className="h-4 w-4" />
            ) : transferType === TransferType.SELF_TRANSFER ? (
              <ShieldAlert className="h-4 w-4" />
            ) : (
              <Info className="h-4 w-4" />
            )}
            <AlertTitle>
              {transferType === TransferType.MANAGED
                ? "Protected Transfer"
                : transferType === TransferType.PROTECTED_SELF_TRANSFER
                  ? "OTA Virtual Interline"
                  : transferType === TransferType.SELF_TRANSFER
                    ? "Non-Protected Self-Transfer"
                    : "Transfer Type Unspecified"}
            </AlertTitle>
          </div>
          <AlertDescription className="mt-2">
            {transferType === TransferType.MANAGED
              ? "This is a protected transfer managed by the agent. If you miss a connection due to delays, the agent will find alternatives at no extra cost."
              : transferType === TransferType.PROTECTED_SELF_TRANSFER
                ? "This is an OTA Virtual Interline. The travel agent offers some protection if things go wrong, but you'll need to collect and re-check your baggage between flights. If you experience delays or cancellations, contact the travel agent directly (not the airlines) for assistance with rebooking."
                : transferType === TransferType.SELF_TRANSFER
                  ? "This is a non-protected self-transfer. You'll have multiple booking references and will need to collect and re-check your baggage. If you miss a connection, you'll need to buy a new ticket."
                  : "The transfer type for this flight is not specified. Please check with the agent for details."}
          </AlertDescription>
        </Alert>
      )}

      {/* Multiple Booking Warning - only show if not already covered by a mashup warning */}
      {isMultiBooking && mashupType === MashupType.NONE && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Multiple Bookings Required</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              This itinerary requires {bookingLinksCount} separate bookings. You must complete all bookings to secure
              your entire journey.
            </p>
            <p className="font-medium">
              We highly recommend opening all booking links first before making any purchases to ensure availability for
              all parts of your journey.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
