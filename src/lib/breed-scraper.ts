import axios from 'axios';
import { PetBreed, BreedCareDetail } from './data';

interface WikiPage {
    pageid: number;
    title: string;
    extract: string;
    thumbnail?: {
        source: string;
    };
    original?: {
        source: string;
    };
}

export async function scrapeBreedFromWiki(breedName: string, speciesName: string): Promise<Partial<PetBreed> | null> {
    const query = `${breedName} (${speciesName.toLowerCase()})`;
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages|pageprops&exintro=1&explaintext=1&piprop=original|thumbnail&titles=${encodeURIComponent(breedName)}|${encodeURIComponent(query)}&redirects=1&origin=*`;

    try {
        const response = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'PetVerse/1.0 (https://petverse.example.com; contact@example.com)' }
        });
        const pages = response.data.query.pages;
        const pageId = Object.keys(pages)[0];

        if (pageId === '-1') {
            // Try a more general search if exact title fails
            const searchRes = await axios.get(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(breedName + ' ' + speciesName)}&format=json&origin=*`, {
                headers: { 'User-Agent': 'PetVerse/1.0 (https://petverse.example.com; contact@example.com)' }
            });
            if (searchRes.data.query.search.length > 0) {
                const topResult = searchRes.data.query.search[0].title;
                return scrapeBreedFromWiki(topResult, speciesName);
            }
            return null;
        }

        const page: WikiPage = pages[pageId];

        // Fetch full content for care details
        const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=${encodeURIComponent(page.title)}&format=json&origin=*`;
        const contentResponse = await axios.get(contentUrl, {
            headers: { 'User-Agent': 'PetVerse/1.0 (https://petverse.example.com; contact@example.com)' }
        });
        const fullExtract = contentResponse.data.query.pages[pageId].extract;

        const careDetails: BreedCareDetail[] = [];

        // Comprehensive Mapping and Keywords
        const sectionMapping: Record<string, string[]> = {
            'Temperament': ['temperament', 'characteristics', 'personality', 'behavior', 'nature'],
            'Lifespan': ['lifespan', 'longevity', 'life expectancy'],
            'Size': ['size', 'appearance', 'weight', 'height', 'dimensions'],
            'Diet': ['diet', 'feeding', 'nutrition', 'food'],
            'Exercise Needs': ['exercise', 'activity', 'energy level', 'training requirements', 'work'],
            'Grooming': ['grooming', 'coat', 'maintenance', 'care', 'shedding'],
            'Health Issues': ['health', 'medical', 'diseases', 'conditions', 'disorders', 'genetic'],
            'Training Difficulty': ['training', 'obedience', 'intelligence', 'learnability'],
            'Suitability for Families': ['family', 'children', 'kids', 'socialization', 'temperament'],
            'Climate Adaptability': ['climate', 'weather', 'cold', 'heat', 'temperature', 'hardiness'],
            'Living Space Requirements': ['living space', 'apartment', 'housing', 'indoors', 'outdoors'],
            'Fun Facts': ['facts', 'trivia', 'history', 'origin', 'etymology', 'naming', 'popular culture'],
        };

        // Split by top-level headers (e.g., == History ==)
        const sections = fullExtract.split(/\n\s*==[^=]+\s*==\s*\n/);
        const headers = fullExtract.match(/\n\s*==[^=]+\s*==\s*\n/g) || [];

        const extractedSections: Record<string, string> = {
            'Overview': sections[0].trim()
        };

        headers.forEach((header: string, i: number) => {
            const title = header.replace(/=/g, '').trim();
            const content = sections[i + 1]?.trim();
            if (title && content) {
                extractedSections[title] = content;
            }
        });

        // Map extracted sections to our target categories
        for (const [targetCategory, keywords] of Object.entries(sectionMapping)) {
            let categoryContent = '';

            for (const [title, content] of Object.entries(extractedSections)) {
                if (keywords.some(keyword => title.toLowerCase().includes(keyword))) {
                    // Clean up sub-headers in content (e.g., === Origin ===)
                    const cleanedContent = content.replace(/===+.*?===+/g, '').trim();
                    if (cleanedContent) {
                        categoryContent += (categoryContent ? '\n\n' : '') + cleanedContent;
                    }
                }
            }

            if (categoryContent.trim()) {
                careDetails.push({
                    title: targetCategory,
                    content: categoryContent.trim().substring(0, 1000) + (categoryContent.trim().length > 1000 ? '...' : '')
                });
            }
        }

        // Ensure we always have an Overview if it wasn't mapped elsewhere
        if (!careDetails.some(d => d.title === 'Overview')) {
            careDetails.unshift({
                title: 'Overview',
                content: extractedSections['Overview'].substring(0, 1000)
            });
        }

        const imageIds: string[] = [];
        if (page.original?.source) imageIds.push(page.original.source);
        else if (page.thumbnail?.source) imageIds.push(page.thumbnail.source);

        return {
            name: page.title,
            description: page.extract.split('.')[0] + '.', // First sentence as summary
            careDetails: careDetails,
            imageIds: imageIds
        };
    } catch (error) {
        console.error('Error scraping Wikipedia:', error);
        return null;
    }
}
