-- Direct customer reviews are moderated like order-linked reviews, but are not
-- required to originate from a delivery invitation.
ALTER TABLE "Review" ALTER COLUMN "orderId" DROP NOT NULL;
