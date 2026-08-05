import SearchForm from '@/components/form/SearchForm';

export default async function HomePage() {
    // createAndStoreEmbeddings('movies.txt');
    return (
        <div className="py-20">
            {/* <DocumentForm /> */}
            <SearchForm />
        </div>
    );
}
