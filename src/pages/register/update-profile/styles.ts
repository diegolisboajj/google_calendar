import { Box, Text, styled } from '@ignite-ui/react'

export const ProfileBox = styled(Box, {
  marginTop: '$6',
  display: 'flex',
  flexDirection: 'column',
  gap: '$4',

  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '$2',
  },
})

export const Annotation = styled(Text, {
  color: '$gray200',
})

export const PictureInput = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$4',
  alignSelf: 'flex-start',

  'input[type=file]': {
    visibility: 'hidden',
  },
})