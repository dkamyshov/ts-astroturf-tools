import styled from 'astroturf/react';

const RED = 'red';

const A = styled.div`
  color: red;
`;

export const SomeComponent = styled(A)`
  background: ${RED};
`;
