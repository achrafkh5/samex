import Navbar from '../../components/Navbar';
import InscriptionPageContent from '../../components/InscriptionPageContent';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Client Registration - Dream Cars',
  description: 'Complete your car registration form to reserve or purchase your dream car.',
};

export default async function InscriptionPage({params}) {
  const { id } = await params;
  return (
    <>
      <Navbar />
      <InscriptionPageContent id={id} />
      <Footer />
    </>
  );
}
