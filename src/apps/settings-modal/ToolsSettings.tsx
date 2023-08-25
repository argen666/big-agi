import * as React from 'react';

import { FormHelperText, Stack } from '@mui/joy';

import { GoogleSearchSettings } from '~/modules/google/GoogleSearchSettings';
import { EmbeddingsSettings } from '~/modules/llms/openai/embeddings/EmbeddingsSettings';

import { settingsGap } from '~/common/theme';

export function ToolsSettings() {

  return (

    <Stack direction='column' sx={{ gap: settingsGap }}>

      <FormHelperText>
        🛠️ Tools enable additional capabilities if enabled and correctly configured
      </FormHelperText>

      <GoogleSearchSettings />
      <EmbeddingsSettings />

    </Stack>

  );
}