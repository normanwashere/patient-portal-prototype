import { ALL_CONTENT } from './src/data/content';
import * as fs from 'fs';
import * as path from 'path';

async function auditImages() {
    console.log('Starting Image Audit...');
    const broken: any[] = [];

    // Group by tenant for clearer output
    const items = ALL_CONTENT;
    console.log(`Checking ${items.length} items...`);

    for (const item of items) {
        if (!item.image) {
            continue;
        }

        try {
            const response = await fetch(item.image, { method: 'HEAD' });
            if (!response.ok) {
                console.error(`[FAIL] ${item.tenantId} | ${item.title}: ${item.image} (${response.status})`);
                broken.push({
                    id: item.id,
                    title: item.title,
                    url: item.image,
                    status: response.status,
                    tenant: item.tenantId || 'global'
                });
            }
        } catch (error: any) {
            console.error(`[ERR] ${item.tenantId} | ${item.title}: ${item.image} (${error.message})`);
            broken.push({
                id: item.id,
                title: item.title,
                url: item.image,
                status: 'Network Error',
                tenant: item.tenantId || 'global'
            });
        }
    }

    console.log('\n\n--- AUDIT RESULTS ---');
    try {
        const reportPath = path.resolve(process.cwd(), 'audit_report.json');
        console.log(`Writing report to: ${reportPath}`);

        if (broken.length === 0) {
            console.log('SUCCESS: All images are accessible.');
            fs.writeFileSync(reportPath, JSON.stringify({ success: true, broken: [] }, null, 2));
            process.exit(0);
        } else {
            console.error(`FAILED: ${broken.length} broken images found.`);
            fs.writeFileSync(reportPath, JSON.stringify({ success: false, broken }, null, 2));
            process.exit(1);
        }
    } catch (err: any) {
        console.error('Failed to write report file:', err);
        process.exit(1);
    }
}

auditImages().catch(err => {
    console.error('Unhandled Script Error:', err);
    process.exit(1);
});
