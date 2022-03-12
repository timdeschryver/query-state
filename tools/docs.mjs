import * as path from 'path';
import * as fs from 'fs';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import {} from '@microsoft/api-documenter';
import { cwd } from 'process';
import { execSync } from 'child_process';

const libsPath = path.join(cwd(), 'libs');
const libs = fs.readdirSync(libsPath);

for (const lib of libs) {
  const apiExtractorJsonPath = path.join(libsPath, lib, 'api-extractor.json');
  if (fs.existsSync(apiExtractorJsonPath)) {
    // Load and parse the api-extractor.json file
    const extractorConfig =
      ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath);
    // Invoke API Extractor
    const extractorResult = Extractor.invoke(extractorConfig, {
      // Equivalent to the "--local" command-line parameter
      localBuild: true,
    });
    if (extractorResult.succeeded) {
      console.log(`[${lib}] API Extractor completed successfully`);
    } else {
      console.error(
        `[${lib}] API Extractor completed with ${extractorResult.errorCount} errors` +
          ` and ${extractorResult.warningCount} warnings`
      );
    }
  }
}

execSync('npx api-documenter markdown -i dist -o docs/api');
