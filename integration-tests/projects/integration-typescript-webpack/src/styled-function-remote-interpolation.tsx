import styled from 'astroturf/react';
import { RED } from './utils/colors';

const A = styled.div`
  color: red;
`;

export const SomeComponent = styled(A)`
  background: ${RED};
`;
