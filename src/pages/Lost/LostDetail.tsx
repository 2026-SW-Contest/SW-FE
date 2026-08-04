import { useParams } from "react-router-dom";

import Layout from "../../components/layout/Layout";

import { lostListData } from "../../mock";

import "./LostDetail.css";

const LostDetail = () => {

  const { id } = useParams();

  const item = lostListData.find(
    (item) => item.id === Number(id)
  );

  if (!item) {
    return (
      <Layout appBarVariant="detail">
        존재하지 않는 분실물입니다.
      </Layout>
    );
  }

  return (
    <Layout appBarVariant="detail">

      <div className="lost-detail">

        <h1>{item.title}</h1>

      </div>

    </Layout>
  );
};

export default LostDetail;