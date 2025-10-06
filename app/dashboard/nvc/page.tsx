"use client";

import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/collapsible-card";
import { NovaReuniaoDialog } from "@/components/nova-reuniao-dialog";
import mockData from "@/data/mock-data.json";
import {
  Calendar,
  BookOpen,
  Clock,
  Music,
  Target,
  Heart,
  Lightbulb,
  MessageSquare,
} from "lucide-react";

export default function NVCPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Nossa Vida Cristã</h2>
        <NovaReuniaoDialog />
      </div>

      <div className="space-y-3">
        {mockData.nossa_vida_crista.map((reuniao) => {
          return (
            <CollapsibleCard
              key={reuniao.id}
              title={`${reuniao.periodo} • ${reuniao.leituraBiblica}`}
              icon={Calendar}
              defaultExpanded={false}
            >
              <div className="space-y-4">
                {/* Cânticos */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Music className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Inicial
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {reuniao.canticos.inicial}
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Music className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        Intermediário
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {reuniao.canticos.intermediario}
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Music className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        Final
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {reuniao.canticos.final}
                    </p>
                  </div>
                </div>

                {/* Comentários */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                        Comentários Iniciais
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {reuniao.comentarios.iniciais}
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                        Comentários Finais
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {reuniao.comentarios.finais}
                    </p>
                  </div>
                </div>

                {/* Tesouros da Palavra de Deus */}
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-base font-semibold text-indigo-600 dark:text-indigo-400">
                      Tesouros da Palavra de Deus
                    </span>
                    <span className="text-sm text-indigo-500 dark:text-indigo-300">
                      ({reuniao.tesourosPalavra.duracao})
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    {reuniao.tesourosPalavra.titulo}
                  </h4>

                  <div className="space-y-2 mb-3">
                    {reuniao.tesourosPalavra.pontos.map((ponto, index) => (
                      <p
                        key={index}
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        • {ponto}
                      </p>
                    ))}
                  </div>

                  {/* Joias Espirituais */}
                  {reuniao.tesourosPalavra.joiasEspirituais.map(
                    (joia, index) => (
                      <div
                        key={index}
                        className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                            Joias Espirituais
                          </span>
                          <span className="text-xs text-gray-500">
                            ({joia.duracao})
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {joia.texto}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          {joia.pergunta}
                        </p>
                        <p className="text-xs text-gray-500">
                          {joia.referencia}
                        </p>
                      </div>
                    )
                  )}

                  {/* Leitura Bíblica */}
                  <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        Leitura Bíblica
                      </span>
                      <span className="text-xs text-gray-500">
                        ({reuniao.tesourosPalavra.leituraBiblica.duracao})
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {reuniao.tesourosPalavra.leituraBiblica.texto}
                    </p>
                    <p className="text-xs text-gray-500">
                      {reuniao.tesourosPalavra.leituraBiblica.referencia}
                    </p>
                  </div>
                </div>

                {/* Faça Seu Melhor */}
                <div className="p-4 bg-teal-50 dark:bg-teal-950/30 rounded-lg border border-teal-200 dark:border-teal-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    <span className="text-base font-semibold text-teal-600 dark:text-teal-400">
                      Faça Seu Melhor
                    </span>
                  </div>

                  <div className="space-y-3">
                    {reuniao.facaSeuMelhor.map((parte, index) => (
                      <div
                        key={index}
                        className="p-3 bg-white dark:bg-gray-800 rounded border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
                            {parte.tipo}
                          </span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-500">
                              {parte.duracao}
                            </span>
                          </div>
                        </div>
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {parte.formato}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          {parte.descricao}
                        </p>
                        <p className="text-xs text-gray-500">
                          {parte.referencia}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nossa Vida Cristã */}
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    <span className="text-base font-semibold text-rose-600 dark:text-rose-400">
                      Nossa Vida Cristã
                    </span>
                  </div>

                  <div className="space-y-3">
                    {reuniao.nossaVidaCrista.map((parte, index) => (
                      <div
                        key={index}
                        className="p-3 bg-white dark:bg-gray-800 rounded border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-rose-600 dark:text-rose-400">
                            {parte.tipo}
                          </span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-500">
                              {parte.duracao}
                            </span>
                          </div>
                        </div>
                        {parte.conteudo && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {parte.conteudo}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Imprimir
                  </Button>
                </div>
              </div>
            </CollapsibleCard>
          );
        })}
      </div>
    </div>
  );
}
