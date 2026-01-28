
export interface Job {
    id: string | number;
    title: string;
    company: string;
    description: string;
    salary: string;
    url: string;
    location: string;
    tags: string[];
    postedAt: string;
}

export async function getNicheJobs(query: string): Promise<{ jobs: Job[] }> {
    const apiKey = process.env.THEIRSTACK_API_KEY;
    if (!apiKey) {
        console.warn("THEIRSTACK_API_KEY is missing. Returning mock data.");
        return {
            jobs: [
                {
                    id: 'mock-1',
                    title: 'Mock AI Architect (No Key)',
                    company: 'Mock Company',
                    salary: '$150k - $200k',
                    description: 'This is a mock job because no API key was provided.',
                    url: '#',
                    location: 'Remote',
                    tags: ['No Experience', 'Full-time'],
                    postedAt: '2 days ago'
                }
            ]
        };
    }

    try {
        const response = await fetch('https://api.theirstack.com/v1/jobs/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'NicheJobAggregator/1.0',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                job_title_or: [query],
                posted_at_max_age_days: 30,
                limit: 10
            }),
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            console.error(`Failed to fetch from TheirStack: ${response.status} ${response.statusText}`);
            return { jobs: [] };
        }

        const data = await response.json();
        const jobs: Job[] = (data.data || []).map((item: any) => {
            const tags = [];
            if (item.remote) tags.push('Remote');
            if (item.seniority) tags.push(item.seniority.replace('_', ' '));
            if (item.employment_statuses && item.employment_statuses.length > 0) {
                tags.push(item.employment_statuses[0].replace('_', ' '));
            }

            return {
                id: item.id,
                title: item.job_title,
                company: item.company,
                description: item.description,
                salary: item.salary_string || (item.min_annual_salary ? `$${item.min_annual_salary} - $${item.max_annual_salary}` : 'Salary hidden'),
                url: item.url || item.source_url,
                location: item.location || 'Unknown Location',
                tags: tags,
                postedAt: item.date_posted || 'Recently'
            };
        });

        return { jobs };

    } catch (e) {
        console.error("Error fetching from TheirStack:", e);
        return { jobs: [] };
    }
}
