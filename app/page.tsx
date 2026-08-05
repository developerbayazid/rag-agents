import DocumentForm from '@/components/form/DocumentsForm';
import SearchForm from '@/components/form/SearchForm';

export default async function HomePage() {
    // createAndStoreEmbeddings('movies.txt');
    return (
        <div className="py-20 flex px-10 gap-3">
            <DocumentForm />
            <SearchForm />
        </div>
    );
}
