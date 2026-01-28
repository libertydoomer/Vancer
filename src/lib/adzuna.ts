
import { Job } from './theirstack';

interface AdzunaJob {
    id: string;
    title: string;
    description: string;
    company: {
        display_name: string;
    };
    location: {
        display_name: string;
    };
    salary_min?: number;
    salary_max?: number;
    redirect_url: string;
    created: string;
    contract_type?: string;
}

export async function getAdzunaJobs(query: string): Promise<Job[]> {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
        console.warn("ADZUNA credentials missing");
        return [];
    }

    try {
        // Fetching page 1, US jobs by default
        const response = await fetch(
            `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(query)}&content-type=application/json`,
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) {
            console.error(`Adzuna API Error: ${response.status} ${response.statusText}`);
            return [];
        }

        const data = await response.json();

        return (data.results || []).map((item: AdzunaJob) => {
            const tags = [];
            if (item.contract_type) tags.push(item.contract_type);

            // Normalize salary
            let salary = 'Salary hidden';
            if (item.salary_min && item.salary_max) {
                salary = `$${Math.round(item.salary_min).toLocaleString()} - $${Math.round(item.salary_max).toLocaleString()}`;
            } else if (item.salary_min) {
                salary = `$${Math.round(item.salary_min).toLocaleString()}+`;
            }

            return {
                id: String(item.id), // Ensure ID is a string
                title: item.title.replace(/<\/?[^>]+(>|$)/g, ""), // Remove HTML tags from title if any
                company: item.company.display_name,
                description: item.description.replace(/<\/?[^>]+(>|$)/g, ""), // Clean description
                salary: salary,
                url: item.redirect_url,
                location: item.location.display_name,
                tags: tags,
                postedAt: item.created
            };
        });

    } catch (error) {
        console.error("Error fetching Adzuna jobs:", error);
        return [];
    }
}
