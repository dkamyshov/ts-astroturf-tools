import styled from 'astroturf';

const RED = 'red';

const A = styled.div`
  color: red;
`;

export const SomeComponent = styled(A)`
  background: ${RED};
`;
