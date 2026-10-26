import { useQuery } from '@tanstack/react-query';
import { Badge, Card, Descriptions, Layout, Space, Tag, Typography } from 'antd';
import { fetchReadiness, toStatusView } from './health';

const { Header, Content, Footer } = Layout;

export function App() {
  const { data, isError } = useQuery({
    queryKey: ['health', 'ready'],
    queryFn: fetchReadiness,
    refetchInterval: 15_000,
  });
  const view = toStatusView(data, isError);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>
          SolarERP
        </Typography.Title>
      </Header>
      <Content style={{ padding: 24, maxWidth: 960, width: '100%', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Typography.Paragraph>
            Sprint 0 foundation is running. Sign-up, login and the business modules arrive in the
            next prompts (see docs/ROADMAP.md).
          </Typography.Paragraph>
          <Card title="System status" extra={<Badge status={view.color} text={view.label} />}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="API version">{data?.version ?? '-'}</Descriptions.Item>
              {Object.entries(data?.checks ?? {}).map(([name, status]) => (
                <Descriptions.Item key={name} label={name}>
                  <Tag color={status === 'up' ? 'green' : 'red'}>{status}</Tag>
                </Descriptions.Item>
              ))}
              <Descriptions.Item label="API docs">
                <a href="/api/docs">/api/docs</a>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Space>
      </Content>
      <Footer style={{ textAlign: 'center' }}>SolarERP · Phase 1 MVP</Footer>
    </Layout>
  );
}
