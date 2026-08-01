import DocumentForm from '@/components/form/DocumentsForm';
import SearchForm from '@/components/form/SearchForm';

export default async function HomePage() {
    return (
        <div className="py-20">
            <DocumentForm />
            <SearchForm />
        </div>
    );
}
