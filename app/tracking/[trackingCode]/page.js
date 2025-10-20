import Navbar from '../../components/Navbar';
import TrackingContent from '../../components/TrackingContent';
import Footer from '../../components/Footer';

export async function generateMetadata({ params }) {
  const { trackingCode } = await params;
  
  return {
    title: `Track Order ${trackingCode} - Dream Cars`,
    description: `Track the real-time delivery status of your vehicle with tracking code: ${trackingCode}`,
  };
}

export default async function TrackingCodePage({ params }) {
  const { trackingCode } = await params;

  return (
    <>
      <Navbar />
      <TrackingContent initialTrackingCode={trackingCode} />
      <Footer />
    </>
  );
}
