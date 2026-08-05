import SearchForm from '@/components/form/SearchForm';

export default async function HomePage() {
    // createAndStoreEmbeddings('movies.txt');
    return (
        <div className="">
            {/* <DocumentForm /> */}
            <SearchForm />
        </div>
    );
}
