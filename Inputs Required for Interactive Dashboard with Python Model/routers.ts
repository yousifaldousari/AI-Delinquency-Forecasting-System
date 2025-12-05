import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

const execPython = (cmd: string) => {
  return execAsync(cmd, { env: { PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin', HOME: process.env.HOME } });
};

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  dashboard: router({
    overview: publicProcedure.query(async () => {
      const scriptPath = path.join(process.cwd(), "server", "executive_service.py");
      const cmd = `python3 -B ${scriptPath} overview`;
      try {
        const { stdout } = await execPython(cmd);
        return JSON.parse(stdout);
      } catch (error: any) {
        throw new Error(`Dashboard error: ${error.message}`);
      }
    }),

    behaviour: publicProcedure.query(async () => {
      const scriptPath = path.join(process.cwd(), "server", "executive_service.py");
      const cmd = `python3 -B ${scriptPath} behaviour`;
      try {
        const { stdout } = await execPython(cmd);
        return JSON.parse(stdout);
      } catch (error: any) {
        throw new Error(`Dashboard error: ${error.message}`);
      }
    }),

    portfolio: publicProcedure.query(async () => {
      const scriptPath = path.join(process.cwd(), "server", "executive_service.py");
      const cmd = `python3 -B ${scriptPath} portfolio`;
      try {
        const { stdout } = await execPython(cmd);
        return JSON.parse(stdout);
      } catch (error: any) {
        throw new Error(`Dashboard error: ${error.message}`);
      }
    }),

    performance: publicProcedure.query(async () => {
      const scriptPath = path.join(process.cwd(), "server", "executive_service.py");
      const cmd = `python3 -B ${scriptPath} performance`;
      try {
        const { stdout } = await execPython(cmd);
        return JSON.parse(stdout);
      } catch (error: any) {
        throw new Error(`Dashboard error: ${error.message}`);
      }
    }),

    advancedPatterns: publicProcedure.query(async () => {
      const scriptPath = path.join(process.cwd(), "server", "executive_service.py");
      const cmd = `python3 -B ${scriptPath} advanced_patterns`;
      try {
        const { stdout } = await execPython(cmd);
        return JSON.parse(stdout);
      } catch (error: any) {
        throw new Error(`Dashboard error: ${error.message}`);
      }
    }),

    predictRisk: publicProcedure
      .input(z.record(z.string(), z.number()))
      .query(async ({ input }) => {
      const scriptPath = path.join(process.cwd(), "server", "executive_service.py");
      const cmd = `python3 -B ${scriptPath} predict '${JSON.stringify(input)}'`;
      try {
        const { stdout } = await execPython(cmd);
        return JSON.parse(stdout);
      } catch (error: any) {
        throw new Error(`Dashboard error: ${error.message}`);
      }
    }),
  }),

  prediction: router({
    getFeatureSchema: publicProcedure.query(async () => {
      const scriptPath = path.join(process.cwd(), "server", "feature_engineering.py");
      const cmd = `python3 -B ${scriptPath} schema`;
      try {
        const { stdout } = await execPython(cmd);
        return JSON.parse(stdout);
      } catch (error: any) {
        throw new Error(`Feature schema error: ${error.message}`);
      }
    }),

    getFeatureMapping: publicProcedure.query(async () => {
      const fs = await import('fs/promises');
      const mappingPath = path.join(process.cwd(), "server", "feature_mapping.json");
      try {
        const data = await fs.readFile(mappingPath, 'utf-8');
        return JSON.parse(data);
      } catch (error: any) {
        throw new Error(`Feature mapping error: ${error.message}`);
      }
    }),

    getFeatureImportance: publicProcedure.query(async () => {
      const fs = await import('fs/promises');
      const importancePath = path.join(process.cwd(), "server", "feature_importance.json");
      try {
        const data = await fs.readFile(importancePath, 'utf-8');
        return JSON.parse(data);
      } catch (error: any) {
        throw new Error(`Feature importance error: ${error.message}`);
      }
    }),

    singlePredict: publicProcedure
      .input(z.record(z.string(), z.number()))
      .mutation(async ({ input }) => {
      const featureScriptPath = path.join(process.cwd(), "server", "feature_engineering.py");
      const featureCmd = `python3 -B ${featureScriptPath} single '${JSON.stringify(input)}'`;
      try {
        const { stdout: featureStdout } = await execPython(featureCmd);
        const featureResult = JSON.parse(featureStdout);
        if (!featureResult.success) throw new Error(featureResult.error);
        
        const mlScriptPath = path.join(process.cwd(), "server", "executive_service.py");
        const mlCmd = `python3 -B ${mlScriptPath} predict '${JSON.stringify(featureResult.features)}'`;
        const { stdout: mlStdout } = await execPython(mlCmd);
        const prediction = JSON.parse(mlStdout);
        
        return { 
          success: true, 
          base_inputs: featureResult.base_inputs, 
          derived_features: featureResult.derived_features, 
          prediction: prediction 
        };
      } catch (error: any) {
        throw new Error(`Prediction error: ${error.message}`);
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
