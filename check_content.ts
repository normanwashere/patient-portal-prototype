import { ALL_CONTENT } from './src/data/content';
import * as fs from 'fs';

const tenants = ['maxicare', 'metroGeneral', 'meralcoWellness', 'healthFirst'];
const categories = ['event', 'guide', 'news', 'campaign'];

let failed = false;
const log: string[] = [];

function print(msg: string) {
    console.log(msg);
    log.push(msg);
}

print(`Total Content Items: ${ALL_CONTENT.length}`);

tenants.forEach(tenantId => {
    print(`\nChecking Tenant: ${tenantId}`);

    categories.forEach(cat => {
        const items = ALL_CONTENT.filter(c =>
            (c.tenantId === tenantId) &&
            (c.type === cat || (cat === 'news' && c.type === 'feature'))
        );

        if (items.length < 3) {
            print(`    [FAIL] ${cat}: Expected 3+, found ${items.length}`);
            failed = true;
        } else {
            print(`    [PASS] ${cat}: ${items.length} items`);
        }
    });
});

fs.writeFileSync('verify_result.txt', log.join('\n'));

if (failed) {
    print('\nVerification FAILED');
    process.exit(1);
} else {
    print('\nVerification SUCCESS');
    process.exit(0);
}
