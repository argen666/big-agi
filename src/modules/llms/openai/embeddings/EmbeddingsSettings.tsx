import * as React from 'react';
import { shallow } from 'zustand/shallow';

import { Box, CircularProgress, FormControl, FormHelperText, FormLabel, IconButton, Input, Option, Select, Slider, Stack, Tooltip } from '@mui/joy';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import KeyIcon from '@mui/icons-material/Key';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { Section } from '~/common/components/Section';
//import { settingsGap } from '@/common/theme';
import { Link } from '~/common/components/Link';
import { settingsCol1Width, settingsGap } from '~/common/theme';
import { useEmbeddingsStore } from './store-embeddings';


import {
  isValidDatabaseUrl,
  embeddingsDefaultIndex,
  embeddingsDefaultDocCount,
  embeddingsDefaultChainType,
  requireUserKeyEmbeddings, requireIndexEmbeddings, embeddingsDefaultEmbeddingsModel, embeddingsDefaultApiKey,
} from './embeddings.client';


export function EmbeddingsSettings() {
  // state
  const [showApiKeyValue, setShowApiKeyValue] = React.useState(false);

  // external state
  const { apiKey, setApiKey, index, setIndex, docsCount, setDocsCount,chainType,setChainType, embeddingsModel,setEmbeddingsModel} = useEmbeddingsStore(state => ({
    apiKey: state.embeddingsApiKey, setApiKey: state.setEmbeddingsApiKey,
    index: state.embeddingsIndex, setIndex: state.setEmbeddingsIndex,
    docsCount: state.embeddingsDocs, setDocsCount: state.setEmbeddingsDocs,
    chainType: state.embeddingsChainType, setChainType: state.setEmbeddingsChainType,
    embeddingsModel: state.embeddingsModel, setEmbeddingsModel: state.setEmbeddingsModel
  }), shallow);

  const requiresKey = requireUserKeyEmbeddings;
  const requiresIndex = requireIndexEmbeddings;
  const isValidKey = apiKey ? isValidDatabaseUrl(apiKey) : !requiresKey;

  const handleToggleApiKeyVisibility = () => setShowApiKeyValue(!showApiKeyValue);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value);

  const handleChainTypeChange = (e: any, value: string | null) => value && setChainType(value);

  //const handleEmbeddingsModelChange = (e: any, value: string | null) => value && setEmbeddingsModel(value);

  const handleEmbeddingsModelChange = (e: any, value: string | null) => {
    if (value) {
      setEmbeddingsModel(value);
      const selectedModel = embeddingModels.find(model => model.name_model === value);
      if (selectedModel) {
        setIndex(selectedModel.name_index);
      }
    }
  };

  const colWidth = 150;

  const chainTypes = ['stuff', 'map_reduce', 'refine', 'map_rerank'];
  const embeddingModelsOld = ['openai', 'bge-large-en'];
  const embeddingModels = [{"name_model":'openai',"name_index":"cashq_legal"}, {"name_model":'bge-large-en',"name_index":"cashq_legal-bge"}];
  console.log("embeddingsDefaultIndex:"+embeddingsDefaultIndex);
  console.log("embeddingsDefaultApiKey:"+embeddingsDefaultApiKey);

  return (
    <Section title='📚 Embeddings' collapsible collapsed disclaimer='Supported vector database: Elastic' sx={{ mt: 2 }}>
      <Stack direction='column' sx={{ gap: settingsGap, mt: -0.8 }}>

        <FormControl orientation='horizontal' sx={{ justifyContent: 'space-between' }}>
          <FormLabel sx={{ minWidth: colWidth }}>
            Embeddings Model
          </FormLabel>
          <Select
              variant='outlined' placeholder=''
              value={embeddingsModel || embeddingsDefaultEmbeddingsModel} onChange={handleEmbeddingsModelChange}
              indicator={<KeyboardArrowDownIcon />}
              slotProps={{
                root: { sx: { width: '100%' } },
                indicator: { sx: { opacity: 0.5 } },
              }}
          >
            {embeddingModels?.map((mdl, idx) => (
                <Option key={'embedding-model-' + idx} value={mdl.name_model}>
                  {'cashq-'+mdl.name_model}
                </Option>
            ))}
          </Select>
        </FormControl>

        <FormControl orientation='horizontal' sx={{ justifyContent: 'space-between' }}>
          <Box>
            <FormLabel sx={{ minWidth: colWidth }}>
              DB API Key/URL
            </FormLabel>
            <FormHelperText>
              {requiresKey ? '(required)' : '(optional)'}
            </FormHelperText>
          </Box>
          <Input
            variant='outlined' type={showApiKeyValue ? 'text' : 'password'} placeholder={requiresKey ? 'required' : '...'} error={!isValidKey}
            value={apiKey} onChange={handleApiKeyChange}
            startDecorator={<KeyIcon />}
            endDecorator={!!apiKey && (
              <IconButton variant='plain' color='neutral' onClick={handleToggleApiKeyVisibility}>
                {showApiKeyValue ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </IconButton>
            )}
            slotProps={{ input: { sx: { width: '100%' } } }}
            sx={{ width: '100%' }}
          />
        </FormControl>

        <FormControl orientation='horizontal' sx={{ justifyContent: 'space-between' }}>
          <Box>
            <Tooltip title='Database index name'>
              <FormLabel sx={{ minWidth: colWidth }}>
                Index name <InfoOutlinedIcon sx={{ mx: 0.5 }} />
              </FormLabel>
            </Tooltip>
            <FormHelperText>
              {requiresIndex ? '(required)' : '(optional)'}
            </FormHelperText>
          </Box>
          <Input
            aria-label='Index name'
            variant='outlined' type='text' placeholder={requiresIndex ? 'required' : 'optional'} error={requiresIndex}
            value={index || embeddingsDefaultIndex} onChange={(e) => setIndex(e.target.value)}
            slotProps={{ input: { sx: { width: '100%' } } }}
            sx={{ width: '100%' }}
          />
        </FormControl>

        <FormControl orientation='horizontal' sx={{ justifyContent: 'space-between' }}>
          <Box>
            <Tooltip title='The number of documents to return from database'>
              <FormLabel sx={{ minWidth: colWidth }}>
                Docs count <InfoOutlinedIcon sx={{ mx: 0.5 }} />
              </FormLabel>
            </Tooltip>
            <FormHelperText>
              {docsCount ? '' : ''}
            </FormHelperText>
          </Box>
          <Input
            aria-label='Docs count for search'
            variant='outlined' placeholder=''
            value={docsCount || embeddingsDefaultDocCount} onChange={(e) => setDocsCount(e.target.value as unknown as number)}
            slotProps={{
              input: {
                type: 'number',
                sx: { width: '100%' },
              },
            }}
            sx={{ width: '100%' }}
          />
        </FormControl>

        <FormControl orientation='horizontal' sx={{ justifyContent: 'space-between' }}>
          <FormLabel sx={{ minWidth: colWidth }}>
            Chain type
          </FormLabel>
          <Select
              variant='outlined' placeholder={isValidKey ? 'Select a model' : 'Select a model'}
              value={chainType || embeddingsDefaultChainType} onChange={handleChainTypeChange}
              disabled
              indicator={<KeyboardArrowDownIcon />}
              slotProps={{
                root: { sx: { width: '100%' } },
                indicator: { sx: { opacity: 0.5 } },
              }}
          >
            <Option key={'chain-type-none'} value='none'>none</Option>
            {chainTypes?.map((chain, idx) => (
                <Option key={'chain-type-' + idx} value={chain}>
                  {chain}
                </Option>
            ))}
          </Select>
        </FormControl>

      </Stack>
    </Section>
  );
}