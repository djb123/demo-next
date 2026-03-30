import Image from 'next/image';
import { theCatAPI } from '@/app/_api/cats';
import { Breed } from '@thatapicompany/thecatapi';

export default async function Cats(){
    const cats = await theCatAPI.images.searchImages({limit: 10, breeds: [Breed.BENGAL]})
    return (
        <section>
            <h3>Cats!</h3>
            <ul>
                {cats.map((cat, i) => (
                <li key={cat?.id}>
                    <Image
                        src={cat?.url}
                        alt={`Cat ${i}`}
                        width={200}
                        height={40}
                        priority
                    />
                </li>
                ))}
            </ul>
        </section>
    )
}