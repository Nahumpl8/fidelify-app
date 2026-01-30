import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.md};
`;

const LinksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.sm};
`;

const LinkItem = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.sm};
  align-items: flex-start;
  padding: ${({ theme }) => theme.space.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const LinkInputs = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.sm};
`;

const InputRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const InputGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xs};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const RemoveButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.text.muted};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 20px;

  &:hover {
    background: #fee2e2;
    border-color: #ef4444;
    color: #ef4444;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space.sm};
  padding: ${({ theme }) => theme.space.md};
  background: transparent;
  border: 2px dashed ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary}05;
  }
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.space.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const LinkPreview = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.xs};
  padding: ${({ theme }) => theme.space.xs} ${({ theme }) => theme.space.sm};
  background: ${({ theme }) => theme.colors.primary}10;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.primary};
  margin-top: ${({ theme }) => theme.space.xs};
`;

/**
 * LinkManager - Manage back-side links for the pass
 */
const LinkManager = ({ links = [], onAdd, onUpdate, onRemove, maxLinks = 5 }) => {
  const canAddMore = links.length < maxLinks;

  return (
    <Container>
      {links.length === 0 ? (
        <EmptyState>
          No hay links configurados. Agrega links para que aparezcan en el reverso del pase.
        </EmptyState>
      ) : (
        <LinksList>
          {links.map((link, index) => (
            <LinkItem key={link.id || index}>
              <LinkInputs>
                <InputRow>
                  <InputGroup>
                    <Label>Etiqueta</Label>
                    <Input
                      type="text"
                      value={link.label || ''}
                      onChange={(e) => onUpdate(index, { label: e.target.value })}
                      placeholder="Ej: Haz tu pedido"
                    />
                  </InputGroup>
                  <InputGroup>
                    <Label>URL</Label>
                    <Input
                      type="url"
                      value={link.url || ''}
                      onChange={(e) => onUpdate(index, { url: e.target.value })}
                      placeholder="https://..."
                    />
                  </InputGroup>
                </InputRow>
                {link.label && link.url && (
                  <LinkPreview>
                    <span>Vista previa:</span>
                    <strong>{link.label}</strong>
                  </LinkPreview>
                )}
              </LinkInputs>
              <RemoveButton type="button" onClick={() => onRemove(index)}>
                x
              </RemoveButton>
            </LinkItem>
          ))}
        </LinksList>
      )}

      {canAddMore && (
        <AddButton type="button" onClick={() => onAdd({ label: '', url: '' })}>
          + Agregar Link
        </AddButton>
      )}
    </Container>
  );
};

export default LinkManager;
