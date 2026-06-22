import type { Metadata } from 'next';
import { Box, Container, Typography, Divider, Grid } from '@mui/material';
import { CheckCircle, Cancel, Autorenew, CurrencyRupee } from '@mui/icons-material';

export const metadata: Metadata = {
  title: 'Return & Refund Policy | Unique Dressup',
  description: 'Learn about our 7-day return policy, refund process, and how to initiate a return at Unique Dressup.',
};

const LAST_UPDATED = 'June 1, 2025';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, color: '#1a1a1a' }}>
      {title}
    </Typography>
    {children}
  </Box>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="body2" sx={{ color: '#444', lineHeight: 1.9, mb: 1.5 }}>
    {children}
  </Typography>
);

const Li = ({ children }: { children: React.ReactNode }) => (
  <Typography component="li" variant="body2" sx={{ color: '#444', lineHeight: 1.9, mb: 0.5, pl: 1 }}>
    {children}
  </Typography>
);

const highlights = [
  { icon: <Autorenew sx={{ fontSize: 28, color: '#c9a84c' }} />, title: '7-Day Returns', desc: 'Return within 7 days of delivery' },
  { icon: <CurrencyRupee sx={{ fontSize: 28, color: '#c9a84c' }} />, title: 'Full Refund', desc: 'Refunded to original payment method' },
  { icon: <CheckCircle sx={{ fontSize: 28, color: '#c9a84c' }} />, title: 'Easy Process', desc: 'Initiate returns from your account' },
  { icon: <Cancel sx={{ fontSize: 28, color: '#c9a84c' }} />, title: 'No Questions', desc: 'Hassle-free for eligible items' },
];

export default function ReturnPolicyPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      {/* Hero */}
      <Box sx={{ bgcolor: '#1a1a1a', py: { xs: 6, md: 8 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography
            variant="overline"
            sx={{ color: '#c9a84c', letterSpacing: '0.2em', fontWeight: 600, display: 'block', mb: 1 }}
          >
            Customer Support
          </Typography>
          <Typography
            variant="h3"
            sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'white', mb: 1.5 }}
          >
            Return &amp; Refund Policy
          </Typography>
          <Typography variant="body2" sx={{ color: '#aaa' }}>
            Last updated: {LAST_UPDATED}
          </Typography>
        </Container>
      </Box>

      {/* Highlights */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider', py: 5 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center">
            {highlights.map((h) => (
              <Grid item xs={6} sm={3} key={h.title}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ mb: 1 }}>{h.icon}</Box>
                  <Typography variant="body2" fontWeight={700} sx={{ color: '#1a1a1a', mb: 0.5 }}>{h.title}</Typography>
                  <Typography variant="caption" sx={{ color: '#888' }}>{h.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
        <Box sx={{ bgcolor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'divider', p: { xs: 3, md: 5 } }}>

          <P>
            At Unique Dressup, we want you to love what you ordered. If you're not completely satisfied,
            we offer a straightforward return and refund process. Please read this policy carefully before
            initiating a return.
          </P>

          <Divider sx={{ my: 4 }} />

          <Section title="1. Return Eligibility">
            <P>
              You may return an item within <strong>7 days of delivery</strong> provided it meets the
              following conditions:
            </P>
            <Box component="ul" sx={{ pl: 3, m: 0, mb: 1.5 }}>
              <Li>The item is unused, unwashed, and unaltered</Li>
              <Li>Original tags are intact and attached</Li>
              <Li>The item is in its original packaging</Li>
              <Li>The item is not damaged, stained, or shows signs of wear</Li>
              <Li>The return request is raised within 7 days of the delivery date</Li>
            </Box>
          </Section>

          <Section title="2. Non-Returnable Items">
            <P>The following items are not eligible for return:</P>
            <Box component="ul" sx={{ pl: 3, m: 0 }}>
              <Li>Innerwear, lingerie, and swimwear (for hygiene reasons)</Li>
              <Li>Items marked as "Final Sale" or "Non-Returnable" on the product page</Li>
              <Li>Customised or personalised products</Li>
              <Li>Products returned without original packaging or tags</Li>
              <Li>Items showing signs of use, washing, or damage caused by the customer</Li>
              <Li>Gift cards and vouchers</Li>
            </Box>
          </Section>

          <Section title="3. Damaged or Defective Items">
            <P>
              If you receive a damaged, defective, or incorrect item, please contact us within{' '}
              <strong>48 hours of delivery</strong> with photographs of the product and packaging.
              We will arrange a free pickup and provide a full refund or replacement at no additional cost.
            </P>
          </Section>

          <Section title="4. How to Initiate a Return">
            <P>To start a return:</P>
            <Box component="ol" sx={{ pl: 3, m: 0, mb: 1.5 }}>
              <Li>Log in to your account and go to <strong>My Orders</strong></Li>
              <Li>Select the order and click <strong>Request Return</strong></Li>
              <Li>Select the item(s) and reason for return</Li>
              <Li>Submit the request — our team will review it within 1–2 business days</Li>
              <Li>Once approved, pack the item securely and hand it over to our pickup executive</Li>
            </Box>
            <P>
              Alternatively, you can contact our support team at{' '}
              <strong>support@theuniquedressup.com</strong> with your order number and reason for return.
            </P>
          </Section>

          <Section title="5. Refund Process">
            <P>Once we receive and inspect the returned item:</P>
            <Box component="ul" sx={{ pl: 3, m: 0, mb: 1.5 }}>
              <Li>Inspection is completed within <strong>2–3 business days</strong> of receiving the return</Li>
              <Li>If approved, the refund is initiated within <strong>2 business days</strong></Li>
              <Li>Refunds are credited to the <strong>original payment method</strong></Li>
              <Li>Bank processing may take an additional 5–7 business days depending on your bank</Li>
            </Box>
            <P>
              For COD orders, refunds are processed via bank transfer or UPI. You will be asked to
              provide your bank account details during the return process.
            </P>
          </Section>

          <Section title="6. Shipping Charges on Returns">
            <P>
              <strong>Defective/wrong items:</strong> Free pickup arranged by us. Full refund including
              original shipping charge.
            </P>
            <P>
              <strong>Change of mind returns:</strong> Original shipping charge is non-refundable. Return
              shipping is free for the first return per order; subsequent returns from the same order may
              attract a return shipping fee.
            </P>
          </Section>

          <Section title="7. Exchange Policy">
            <P>
              We currently do not support direct exchanges. If you wish to exchange an item (e.g., for a
              different size or colour), please return the original item for a refund and place a new order.
            </P>
          </Section>

          <Section title="8. Cancellations">
            <P>
              Orders can be cancelled before they are shipped. To cancel an order, go to{' '}
              <strong>My Orders</strong> and click <strong>Cancel Order</strong>, or contact our support
              team. Once an order is shipped, it cannot be cancelled — please initiate a return after delivery.
            </P>
            <P>
              Refunds for cancelled orders are processed within 2–5 business days to the original payment method.
            </P>
          </Section>

          <Section title="9. Contact Us">
            <P>For return or refund queries, please reach out to us:</P>
            <Box sx={{ bgcolor: '#f9f9f9', borderRadius: 1.5, p: 2.5, mt: 1 }}>
              <Typography variant="body2" sx={{ color: '#444', fontWeight: 700, mb: 0.5 }}>Unique Dressup — Customer Support</Typography>
              <Typography variant="body2" sx={{ color: '#444' }}>Email: support@theuniquedressup.com</Typography>
              <Typography variant="body2" sx={{ color: '#444' }}>Support Hours: Monday–Saturday, 10 AM – 6 PM IST</Typography>
            </Box>
          </Section>

        </Box>
      </Container>
    </Box>
  );
}
