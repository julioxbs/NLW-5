import format from "date-fns/format";
import ptBR from "date-fns/locale/pt-BR";
import parseISO from "date-fns/parseISO";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { api } from "../../services/api";
import { convertDurationToTimeString } from "../../utils/convertDuration";

import styles from "./episode.module.scss";
import { useContext } from "react";
import { usePlayer } from "../../contexts/PlayerContext";
import Head from "next/head";

type Episode = {
  id: string;
  title: string;
  members: string;
  published_at: string;
  publishedAt: string;
  description: string;
  duration: number;
  url: string;
  thumbnail: string;
  durationAsString: string;
};

type EpisodeProps = {
  episode: Episode;
};

export default function Episode({ episode }: EpisodeProps) {
  const { play } = usePlayer();

  return (
    <div className={styles.episode}>
      <Head>
        <title>{episode.title}</title>
      </Head>

      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>
        <Image
          width={700}
          height={160}
          src={episode.thumbnail}
          objectFit="cover"
        />
        <button type="button" onClick={() => play(episode)}>
          <img src="/play.svg" alt="tocar episodio" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }}
      />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await api.get("episodes", {
    params: {
      _limit: 2,
      _sort: "published_at",
      _order: "desc",
    },
  });

  const paths = data.map((episode) => {
    return {
      params: {
        slug: episode.id,
      },
    };
  });

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params;

  const { data } = await api.get(`/episodes/${slug}`);

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), "d MMM yy", {
      locale: ptBR,
    }),
    duration: Number(data.file.duration),
    description: data.description,
    url: data.file.url,
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
  };

  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24,
  };
};